/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão: 1.0 - 03/09/2015
 *
 */

// App
angular.module("administrativo-empresas", []) 

.controller("administrativo-empresasCtrl", ['$scope',
                                            '$state',
                                            '$filter',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            function($scope,$state,$filter,/*$campos,*/$webapi,$apis){ 

    var divPortletBodyEmpresaPos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo usuário
    $scope.gruposempresas = [];
    $scope.itens_pagina = [50, 100, 150, 200];
    $scope.busca = ''; // model do input de busca                                            
    $scope.grupoempresa = {busca:'', itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                     };                                            
                                                
    $scope.modalEmpresa = {titulo : '', nome: '', 
                           fl_cardservices : false,
                           fl_taxservices : false,
                           fl_proinfo : false,
                           salvar : function(){}
                          }  
    // flags
    $scope.exibeTela = false;
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false; 
    
    
    // Inicialização do controller
    $scope.administrativo_empresasInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Empresas';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            // Refaz a busca
            if($scope.exibeTela) $scope.buscaEmpresas();
        }); 
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){// && $scope.methodsDoControllerCorrente.length > 0){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'ATUALIZAÇÃO' }).length > 0;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'CADASTRO' }).length > 0;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'REMOÇÃO' }).length > 0;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Busca empresas
            $scope.buscaEmpresas();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Busca empresas
        //$scope.buscaEmpresas();
    };
    
                                                
    // PERMISSÕES
    /**
      * Retorna true se o usuário pode consultar outras empresas
      */
    $scope.usuarioPodeConsultarEmpresas = function(){
        return typeof $scope.usuariologado.grupoempresa === 'undefined';    
    }                                            
    /**
      * Retorna true se o usuário pode cadastrar empresas
      */
    $scope.usuarioPodeCadastrarEmpresas = function(){
        return $scope.usuarioPodeConsultarEmpresas() && permissaoCadastro;    
    }
    /**
      * Retorna true se o usuário pode alterar info de empresas
      */
    $scope.usuarioPodeAlterarEmpresas = function(){
        return $scope.usuarioPodeConsultarEmpresas() && permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir empresas
      */
    $scope.usuarioPodeExcluirEmpresas = function(){
        return $scope.usuarioPodeConsultarEmpresas() && permissaoRemocao;
    }
    /**
      * Retorna true se o usuário pode ativar/desativar empresas
      */
    $scope.usuarioPodeDesativarEmpresas = function(){
        return $scope.usuarioPodeConsultarEmpresas() && permissaoRemocao;
    }
    
    
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.grupoempresa.total_paginas){ 
           $scope.grupoempresa.pagina = pagina;
           $scope.buscaEmpresas(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.grupoempresa.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.grupoempresa.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.grupoempresa.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        if($scope.gruposempresas.length > 0) $scope.buscaEmpresas();   
    };
                                                
                                                
    // BUSCA
    $scope.resetaBusca = function(){
        $scope.busca = '';
        $scope.filtraEmpresas();
    };
    $scope.filtraEmpresas = function(){
        $scope.grupoempresa.busca = $scope.busca;
        $scope.buscaEmpresas();
    };
    $scope.buscaEmpresas = function(){

       $scope.showProgress(divPortletBodyEmpresaPos);    
        
       var filtros = undefined;
       
       // Verifica se tem algum valor para ser filtrado    
       if($scope.grupoempresa.busca.length > 0) filtros = {id: /*$campos.cliente.grupoempresa.ds_nome*/ 101, 
                                                      valor: $scope.grupoempresa.busca + '%'};        
    
       $webapi.get($apis.getUrl($apis.cliente.grupoempresa, 
                                [$scope.token, 3, /*$campos.cliente.grupoempresa.ds_nome*/ 101, 0, 
                                 $scope.grupoempresa.itens_pagina, $scope.grupoempresa.pagina],
                                filtros)) 
            .then(function(dados){
                $scope.gruposempresas = dados.Registros;
                $scope.grupoempresa.total_registros = dados.TotalDeRegistros;
                $scope.grupoempresa.total_paginas = Math.ceil($scope.grupoempresa.total_registros / $scope.grupoempresa.itens_pagina);
                if($scope.gruposempresas.length === 0) $scope.grupoempresa.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.grupoempresa.pagina - 1)*$scope.grupoempresa.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.grupoempresa.itens_pagina;
                    if(registroFinal > $scope.grupoempresa.total_registros) registroFinal = $scope.grupoempresa.total_registros;
                    $scope.grupoempresa.faixa_registros =  registroInicial + '-' + registroFinal;
                }
                // Verifica se a página atual é maior que o total de páginas
                if($scope.grupoempresa.pagina > $scope.grupoempresa.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Esconde o progress
                $scope.hideProgress(divPortletBodyEmpresaPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao requisitar empresas (' + failData.status + ')', true, 'danger', true);
                 // Esconde o progress
                $scope.hideProgress(divPortletBodyEmpresaPos);
              }); 
    };  
                                                
                                                
                                                
    // AÇÕES
    /**
      * Solicita confirmação para desativar a empresa
      */                                           
    $scope.desativar = function(empresa){
        var json = { id_grupo : empresa.id_grupo, 
                     fl_ativo : false,
                     fl_cardservices : empresa.fl_cardservices,
                     fl_proinfo : empresa.fl_proinfo,
                     fl_taxservices : empresa.fl_taxservices
                   };
        $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja desativar ' + empresa.ds_nome.toUpperCase() + ' ?',
                                     ativaEmpresa, json, 'Sim', 'Não');    
    };
    /**
      * Solicita confirmação para ativar a empresa
      */
    $scope.ativar = function(empresa){
        var json = { id_grupo : empresa.id_grupo, 
                     fl_ativo : true,
                     fl_cardservices : empresa.fl_cardservices,
                     fl_proinfo : empresa.fl_proinfo,
                     fl_taxservices : empresa.fl_taxservices
                   };
        $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja desativar ' + empresa.ds_nome.toUpperCase() + ' ?',
                                     ativaEmpresa, json, 'Sim', 'Não');
    };
    /**
      * Efetiva a ativação/desativação da empresa
      */
    var ativaEmpresa = function(json){
         $scope.showProgress(divPortletBodyEmpresaPos);
         // Atualiza
         $webapi.update($apis.getUrl($apis.cliente.grupoempresa, undefined,
                                  {id: 'token', valor: $scope.token}), json)
                .then(function(dados){
                     // Exibe a mensagem de sucesso
                    $scope.showAlert('Status ativo da empresa alterado com sucesso!', true, 'success', true);
                    // Hide progress
                    $scope.hideProgress(divPortletBodyEmpresaPos);
                    // Refaz a busca
                    $scope.buscaEmpresas();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', 
                                                                true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao alterar o status ativo da empresa (' + 
                                           failData.status + ')', true, 'danger', true);
                     // Hide progress
                     $scope.hideProgress(divPortletBodyEmpresaPos);
                  });    
    };                                            
    /**
      * Vai para a tela de filiais, setando a empresa associada ao usuário logado como a selecionada
      */
    $scope.verFiliais = function(empresa){
        //console.log("VER FILIAIS DE '" + empresa.ds_nome + "' (" + empresa.id_grupo + ")");
        if(!$scope.usuariologado.grupoempresa) $scope.selecionaGrupoEmpresa(empresa, function(){ $scope.goAdministrativoFiliais(); });
        else $scope.goAdministrativoFiliais();
    };
    /**
      * Valida o nome grupo empresa
      */
    var validaGrupoEmpresa = function(empresa){
        // Verifica se enviou empresa
        if(empresa){
            // Verifica se teve alterações!
            if(empresa.ds_nome === $scope.modalEmpresa.nome &&
               empresa.fl_cardservices === $scope.modalEmpresa.fl_cardservices &&
               empresa.fl_proinfo === $scope.modalEmpresa.fl_proinfo &&
               empresa.fl_taxservices === $scope.modalEmpresa.fl_taxservices){
                // Não teve alterações
                $('#modalEmpresa').modal('hide');
                return;
            }
        }
        if($scope.modalEmpresa.nome.length < 3){
            $scope.showModalAlerta('Nome muito curto!');    
            return;
        }
        // Verifica se o nome existe
        $scope.showProgress();    
        
        // Obtém o JSON
        var jsonEmpresa = { ds_nome : $scope.modalEmpresa.nome,
                            fl_cardservices : $scope.modalEmpresa.fl_cardservices,
                            fl_taxservices : $scope.modalEmpresa.fl_taxservices,
                            fl_proinfo : $scope.modalEmpresa.fl_proinfo
                          };
        
        if(empresa && empresa.ds_nome.toUpperCase() === $scope.modalEmpresa.nome.toUpperCase()){
            // Salva no banco
            jsonEmpresa.id_grupo = empresa.id_grupo;
            jsonEmpresa.fl_ativo = empresa.fl_ativo;
            alteraGrupoEmpresa(jsonEmpresa);
        }else{
            // Busca no servidor
            var filtros = {id: /*$campos.cliente.grupoempresa.ds_nome*/ 101, 
                          valor: $scope.modalEmpresa.nome};        

            $webapi.get($apis.getUrl($apis.cliente.grupoempresa, [$scope.token, 0], filtros)) 
                .then(function(dados){
                    if(dados.Registros.length > 0){
                        $scope.hideProgress();
                        $scope.showModalAlerta('Já existe um grupo empresa com esse nome!');    
                        return;      
                    }
                    if(empresa){
                        jsonEmpresa.id_grupo = empresa.id_grupo;
                        jsonEmpresa.fl_ativo = empresa.fl_ativo;
                        alteraGrupoEmpresa(jsonEmpresa);
                    }else adicionaGrupoEmpresa(jsonEmpresa);
                        
                  },
                  function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao validar a empresa informada (' + failData.status + ')', true, 'danger', true);
                     // Esconde o progress
                    $scope.hideProgress();
                  }); 
        }
    };
    /**
      * Exibe o modal para preenchimento das informações do novo grupo empresa
      */
    $scope.cadastraNovaEmpresa = function(){
        $scope.modalEmpresa.titulo = 'Cadastro de Empresa';
        $scope.modalEmpresa.nome = '';
        $scope.modalEmpresa.fl_cardservices = $scope.modalEmpresa.fl_proinfo = $scope.modalEmpresa.fl_taxservices = false;
        $scope.modalEmpresa.salvar = function(){ validaGrupoEmpresa() };
        $('#modalEmpresa').modal('show');    
    };
    /**
      * Exibe o modal para editar as informações da empresa
      */
    $scope.editarEmpresa = function(grupoempresa){
        $scope.modalEmpresa.titulo = 'Alteração de Empresa';
        $scope.modalEmpresa.nome = grupoempresa.ds_nome;
        $scope.modalEmpresa.fl_cardservices = grupoempresa.fl_cardservices;
        $scope.modalEmpresa.fl_proinfo = grupoempresa.fl_proinfo;
        $scope.modalEmpresa.fl_taxservices = grupoempresa.fl_taxservices;
        $scope.modalEmpresa.salvar = function(){ validaGrupoEmpresa(grupoempresa) };
        $('#modalEmpresa').modal('show');
    };
    /**
      * Solicitação confirmação para excluir a empresa
      */
    $scope.excluirEmpresa = function(grupoempresa){
        $scope.showModalConfirmacao('Confirmação', 
                         'Tem certeza que deseja excluir ' + grupoempresa.ds_nome.toUpperCase(),
                         excluiEmpresa, grupoempresa.id_grupo,
                         'Sim', 'Não');
    };                                             
                                                
     /**
      * Efetiva o cadastro do grupo empresa
      */
    var adicionaGrupoEmpresa = function(jsonEmpresa){
        //console.log(jsonEmpresa);
        $webapi.post($apis.getUrl($apis.cliente.grupoempresa, undefined, 
                                  {id: 'token', valor: $scope.token}), jsonEmpresa)
                .then(function(id_controller){
                    $scope.showAlert('Empresa cadastrada com sucesso!', true, 'success', true);
                    // Dismiss o progress
                    $scope.hideProgress();
                    // Remove o modal da visão
                    $('#modalEmpresa').modal('hide');
                    // Recarrega as empresas
                    $scope.buscaEmpresas();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao cadastrar a empresa (' + failData.status + ')', true, 'danger', true);
                     // Dismiss o progress
                     $scope.hideProgress();
                  }); 
    }
    /**
      * Efetiva a alteração do grupo empresa
      */
    var alteraGrupoEmpresa = function(jsonEmpresa){
        $webapi.update($apis.getUrl($apis.cliente.grupoempresa, undefined, 
                                    {id: 'token', valor: $scope.token}), jsonEmpresa)
                .then(function(id_controller){
                    $scope.showAlert('Empresa alterada com sucesso!', true, 'success', true);
                    // Dismiss o progress
                    $scope.hideProgress();
                    // Remove o modal da visão
                    $('#modalEmpresa').modal('hide');
                    // Recarrega as empresas
                    $scope.buscaEmpresas();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao cadastrar a empresa (' + failData.status + ')', true, 'danger', true);
                     // Dismiss o progress
                     $scope.hideProgress();
                  }); 
    }                                            
    /**
      * Efetivamente a exclusão da empresa
      */
    var excluiEmpresa = function(id_grupo){ 
        $scope.showProgress(divPortletBodyEmpresaPos);
        $webapi.delete($apis.getUrl($apis.cliente.grupoempresa, undefined,
                       [{id: 'token', valor: $scope.token},{id: 'id_grupo', valor: id_grupo}]))
            .then(function(dados){
                    $scope.showAlert('Empresa excluída com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyEmpresaPos);
                    // Recarrega os módulos
                    $scope.buscaEmpresas();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else if(failData.status === 500) $scope.showModalAlerta('Não é possível excluir a empresa. O que pode ser feito é a desativação da mesma');
                     else $scope.showAlert('Houve uma falha ao excluir a empresa (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyEmpresaPos);
                  }); 
    };                                         
                                               
                                                
}]);