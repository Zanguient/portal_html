/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-empresas", []) 

.controller("administrativo-empresasCtrl", ['$scope',
                                            '$state',
                                            '$campos',
                                            '$webapi',
                                            '$apis', 
                                            function($scope,$state,$campos,$webapi,$apis){ 

    var divPortletBodyEmpresaPos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo usuário
    $scope.empresas = [];
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.busca = ''; // model do input de busca                                            
    $scope.empresa = {busca:'', itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                     };                                            
                                                
    $scope.modalEmpresa = {titulo : '', nome: '', 
                           fl_cardservices : false,
                           fl_taxservices : false,
                           fl_proinfo : false,
                           salvar : function(){}
                          }                                            
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
            $scope.buscaEmpresas();
        }); 
        // Obtém as permissões
        if($scope.methods && $scope.methods.length > 0){
            permissaoAlteracao = $filter('filter')($scope.methods, function(m){ return m.ds_method.toUpperCase() === 'ATUALIZAÇÃO' }).length > 0;   
            permissaoCadastro = $filter('filter')($scope.methods, function(m){ return m.ds_method.toUpperCase() === 'CADASTRO' }).length > 0;
            permissaoRemocao = $filter('filter')($scope.methods, function(m){ return m.ds_method.toUpperCase() === 'REMOÇÃO' }).length > 0;
        }
        // Busca empresas
        $scope.buscaEmpresas();
    };
    
                                                
    // PERMISSÕES
    /**
      * Retorna true se o usuário pode consultar outras empresas
      */
    $scope.usuarioPodeConsultarEmpresas = function(){
        return typeof $scope.grupoempresa === 'undefined';    
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
    
    
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.empresa.total_paginas){ 
           $scope.empresa.pagina = pagina;
           $scope.buscaEmpresas(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.empresa.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.empresa.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.setaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.empresa.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        $scope.buscaEmpresas();   
    };
                                                
                                                
    // BUSCA
    $scope.resetaBusca = function(){
        $scope.busca = '';
        $scope.filtraEmpresas();
    };
    $scope.filtraEmpresas = function(){
        $scope.empresa.busca = $scope.busca;
        $scope.buscaEmpresas();
    };
    $scope.buscaEmpresas = function(){

       $scope.showProgress(divPortletBodyEmpresaPos);    
        
       var filtros = undefined;
       
       // Verifica se tem algum valor para ser filtrado    
       if($scope.empresa.busca.length > 0) filtros = {id: $campos.cliente.grupoempresa.ds_nome, 
                                                      valor: $scope.empresa.busca + '%'};        
        
       $webapi.get($apis.getUrl($apis.cliente.grupoempresa, 
                                [$scope.token, 2, $campos.cliente.grupoempresa.ds_nome, 0, 
                                 $scope.empresa.itens_pagina, $scope.empresa.pagina],
                                filtros)) 
            .then(function(dados){
                $scope.empresas = dados.Registros;
                $scope.empresa.total_registros = dados.TotalDeRegistros;
                $scope.empresa.total_paginas = Math.ceil($scope.empresa.total_registros / $scope.empresa.itens_pagina);
                var registroInicial = ($scope.empresa.pagina - 1)*$scope.empresa.itens_pagina + 1;
                var registroFinal = registroInicial - 1 + $scope.empresa.itens_pagina;
                if(registroFinal > $scope.empresa.total_registros) registroFinal = $scope.empresa.total_registros;
                $scope.empresa.faixa_registros =  registroInicial + '-' + registroFinal;
                
                // Verifica se a página atual é maior que o total de páginas
                if($scope.empresa.pagina > $scope.empresa.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Esconde o progress
                $scope.hideProgress(divPortletBodyEmpresaPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao requisitar empresas (' + failData.status + ')', true, 'danger', true);
                 // Esconde o progress
                $scope.hideProgress(divPortletBodyEmpresaPos);
              }); 
    };  
                                                
                                                
                                                
    // AÇÕES
    $scope.verFiliais = function(empresa){
        //console.log("VER FILIAIS DE '" + empresa.ds_nome + "' (" + empresa.id_grupo + ")");
        if(!$scope.grupoempresa) $scope.selecionaGrupoEmpresa(empresa, function(){ $scope.goAdministrativoFiliais(); });
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
            alteraGrupoEmpresa(jsonEmpresa);
        }else{
            // Busca no servidor
            var filtros = {id: $campos.cliente.grupoempresa.ds_nome, 
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
                        alteraGrupoEmpresa(jsonEmpresa);
                    }else adicionaGrupoEmpresa(jsonEmpresa);
                        
                  },
                  function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
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
    $scope.editarEmpresa = function(empresa){
        $scope.modalEmpresa.titulo = 'Alteração de Empresa';
        $scope.modalEmpresa.nome = empresa.ds_nome;
        $scope.modalEmpresa.fl_cardservices = empresa.fl_cardservices;
        $scope.modalEmpresa.fl_proinfo = empresa.fl_proinfo;
        $scope.modalEmpresa.fl_taxservices = empresa.fl_taxservices;
        $scope.modalEmpresa.salvar = function(){ validaGrupoEmpresa(empresa) };
        $('#modalEmpresa').modal('show');
    };
    /**
      * Solicitação confirmação para excluir a empresa
      */
    $scope.excluirEmpresa = function(empresa){
        $scope.showModalConfirmacao('Confirmação', 
                         'Tem certeza que deseja excluir ' + empresa.ds_nome.toUpperCase(),
                         excluiEmpresa, empresa.id_grupo,
                         'Sim', 'Não');
    };                                             
                                                
     /**
      * Efetiva o cadastro do grupo empresa
      */
    var adicionaGrupoEmpresa = function(jsonEmpresa){
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
                     else if(failData.status === 500) $scope.showModalAlerta('Não é possível excluir a empresa. O que pode ser feito é a desativação da mesma');
                     else $scope.showAlert('Houve uma falha ao excluir a empresa (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyEmpresaPos);
                  }); 
    };                                         
                                               
                                                
}]);