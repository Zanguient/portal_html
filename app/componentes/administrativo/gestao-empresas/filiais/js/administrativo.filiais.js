/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-filiais", []) 

.controller("administrativo-filiaisCtrl", ['$scope',
                                           '$state',
                                           '$filter',
                                           '$campos',
                                           '$webapi',
                                           '$apis', 
                                           function($scope,$state,$filter,$campos,$webapi,$apis){ 

    var divPortletBodyFilialPos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo usuário
    $scope.filiais = [];
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.busca = ''; // model do input de busca                                            
    $scope.filial = {busca:'', itens_pagina : $scope.itens_pagina[0], pagina : 1,
                     total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                     };   
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;
                                               
    // Inicialização do controller
    $scope.administrativo_filiaisInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Filiais';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            // Refaz a busca
            $scope.buscaFiliais(true);
        }); 
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){// && $scope.methodsDoControllerCorrente.length > 0){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'ATUALIZAÇÃO' }).length > 0;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'CADASTRO' }).length > 0;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'REMOÇÃO' }).length > 0;
        }
        // Busca filiais
        $scope.buscaFiliais();
    };
                                               
                                               
    // PERMISSÕES
    /**
      * Retorna true se o usuário pode consultar as filiais
      */
    $scope.usuarioPodeConsultarFiliais = function(){
        return typeof $scope.grupoempresa !== 'undefined';    
    }                                            
    /**
      * Retorna true se o usuário pode cadastrar filiais
      */
    $scope.usuarioPodeCadastrarFiliais = function(){
        return $scope.usuarioPodeConsultarFiliais() && permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar info de filiais
      */
    $scope.usuarioPodeAlterarFiliais = function(){
        return $scope.usuarioPodeConsultarFiliais() && permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir filiais
      */
    $scope.usuarioPodeExcluirFiliais = function(){
        return $scope.usuarioPodeConsultarFiliais() && permissaoRemocao;
    } 
    /**
      * Retorna true se o usuário pode ativar/desativar filiais
      */
    $scope.usuarioPodeDesativarFiliais = function(){
        return $scope.usuarioPodeConsultarFiliais() && permissaoRemocao
    };
    
    
    
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filial.total_paginas){ 
           $scope.filial.pagina = pagina;
           $scope.buscaFiliais(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filial.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filial.pagina + 1); 
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
        $scope.paginaInformada = $scope.filial.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        $scope.buscaFiliais();   
    };
                                               
                                               
                                               
    // BUSCA
    $scope.resetaBusca = function(){
        $scope.busca = '';
        $scope.filtraFiliais();
    };
    $scope.filtraFiliais = function(){
        $scope.filial.busca = $scope.busca;
        $scope.buscaFiliais();
    };
    $scope.buscaFiliais = function(showMessage){
        
       if(!$scope.grupoempresa){
           $scope.filiais = [];
           $scope.filial.total_registros = 0;
           $scope.filial.total_paginas = 0;
           $scope.filial.faixa_registros = '0-0';
           $scope.paginaInformada = 1;
           if(showMessage) $scope.showAlert('É necessário selecionar um grupo empresa!', true, 'warning', true);             
       }else{

           $scope.showProgress(divPortletBodyFilialPos);    

           var filtros = [{id: $campos.cliente.empresa.id_grupo, 
                           valor: $scope.grupoempresa.id_grupo}];

           // Verifica se tem algum valor para ser filtrado    
           if($scope.filial.busca.length > 0) filtros.push({id: $campos.cliente.empresa.ds_fantasia, 
                                                            valor: $scope.filial.busca + '%'});        

           $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                    [$scope.token, 2, $campos.cliente.empresa.ds_fantasia, 0, 
                                     $scope.filial.itens_pagina, $scope.filial.pagina],
                                    filtros)) 
                .then(function(dados){
                    $scope.filiais = dados.Registros;
                    $scope.filial.total_registros = dados.TotalDeRegistros;
                    $scope.filial.total_paginas = Math.ceil($scope.filial.total_registros / $scope.filial.itens_pagina);
                    if($scope.filiais.length === 0) $scope.filial.faixa_registros = '0-0';
                    else{
                        var registroInicial = ($scope.filial.pagina - 1)*$scope.filial.itens_pagina + 1;
                        var registroFinal = registroInicial - 1 + $scope.filial.itens_pagina;
                        if(registroFinal > $scope.filial.total_registros) registroFinal = $scope.filial.total_registros;
                        $scope.filial.faixa_registros =  registroInicial + '-' + registroFinal;
                    }
                    // Verifica se a página atual é maior que o total de páginas
                    if($scope.filial.pagina > $scope.filial.total_paginas)
                        setPagina(1); // volta para a primeira página e refaz a busca

                    // Esconde o progress
                    $scope.hideProgress(divPortletBodyFilialPos);
                  },
                  function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else $scope.showAlert('Houve uma falha ao requisitar filiais (' + failData.status + ')', true, 'danger', true);
                     // Esconde o progress
                    $scope.hideProgress(divPortletBodyFilialPos);
                  }); 
       }
    }; 
                                               
                                               
    // AÇÕES
    /**
      * Solicita confirmação para desativar a filial
      */                                           
    $scope.desativar = function(filial){
        var json = { nu_cnpj : filial.nu_cnpj, 
                     id_grupo : filial.id_grupo,
                     fl_ativo : 0 };
        $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja desativar ' + filial.ds_fantasia.toUpperCase() + ' ?',
                                     ativaFilial, json, 'Sim', 'Não');    
    };
    /**
      * Solicita confirmação para ativar a filial
      */
    $scope.ativar = function(filial){
        var json = { nu_cnpj : filial.nu_cnpj, 
                     id_grupo : filial.id_grupo,
                     fl_ativo : 1 };
        $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja ativar ' + filial.ds_fantasia.toUpperCase() + ' ?',
                                     ativaFilial, json, 'Sim', 'Não');
    };
    /**
      * Efetiva a ativação/desativação da filial
      */
    var ativaFilial = function(json){
         // Atualiza
         $webapi.update($apis.getUrl($apis.cliente.empresa, undefined,
                                  {id: 'token', valor: $scope.token}), json)
                .then(function(dados){
                     // Exibe a mensagem de sucesso
                    $scope.showAlert('Filial alterada com sucesso!', true, 'success', true);
                    // Hide progress
                    $scope.hideProgress(divPortletBodyFilialPos);
                    // Refaz a busca
                    $scope.buscaFiliais();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else $scope.showAlert('Houve uma falha ao alterar o status ativo da filial (' + failData.status + ')', true, 'danger', true);
                     // Hide progress
                     $scope.hideProgress(divPortletBodyFilialPos);
                  });    
    };
    /**
      * Vai para a tela de alteração
      */                                           
    $scope.editarFilial = function(filial){
        $scope.goAdministrativoFiliaisCadastro({filial:filial});        
    };
    /**
      * Solicita confirmação para excluir a filial
      */
    $scope.excluirFilial = function(filial){
        $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja excluir ' + filial.ds_fantasia.toUpperCase() + ' ?',
                                     excluiFilial, filial.nu_cnpj, 'Sim', 'Não');
    }; 
    /**
      * Efetiva a exclusão da filial
      */
    var excluiFilial = function(nu_cnpj){
         // Exclui
         $webapi.delete($apis.getUrl($apis.cliente.empresa, undefined,
                                     [{id: 'token', valor: $scope.token},
                                      {id: 'nu_cnpj', valor: nu_cnpj}]))
                .then(function(dados){
                    // Exibe a mensagem de sucesso
                    $scope.showAlert('Filial excluída com sucesso!', true, 'success', true);
                    // Hide progress
                    $scope.hideProgress(divPortletBodyFilialPos);
                    // Refaz a busca
                    $scope.buscaFiliais(true);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 500) $scope.showModalAlerta('Não é possível excluir a filial. O que pode ser feito é a desativação da mesma');
                     else $scope.showAlert('Houve uma falha ao excluir a filial (' + failData.status + ')', true, 'danger', true);
                     // Hide progress
                     $scope.hideProgress(divPortletBodyFilialPos);
                  });    
    };                                           
                                               
}]);