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
                                           '$campos',
                                           '$webapi',
                                           '$apis', 
                                           function($scope,$state,$campos,$webapi,$apis){ 

    var divPortletBodyFilialPos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo usuário
    $scope.filiais = [];
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.busca = ''; // model do input de busca                                            
    $scope.filial = {busca:'', itens_pagina : $scope.itens_pagina[0], pagina : 1,
                     total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                     };                                            
                                               
                                               
    // Inicialização do controller
    $scope.administrativo_filiaisInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Filiais';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state){
            $state.go(state);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            // Refaz a busca
            $scope.buscaFiliais(true);
        }); 
        // Busca filiais
        $scope.buscaFiliais();
    };
                                               
                                               
    // PERMISSÕES
    /**
      * Retorna true se o usuário pode consultar outras filiais
      */
    $scope.usuarioPodeConsultarFiliais = function(){
        return $scope.PERMISSAO_ADMINISTRATIVO && $scope.grupoempresa;    
    }                                            
    /**
      * Retorna true se o usuário pode cadastrar filiais
      */
    $scope.usuarioPodeCadastrarFiliais = function(){
        return $scope.usuarioPodeConsultarFiliais();  
               // && TEM PERMISSAO DO METODO POST    
    }
    /**
      * Retorna true se o usuário pode alterar info de filiais
      */
    $scope.usuarioPodeAlterarFiliais = function(){
        return $scope.usuarioPodeConsultarFiliais(); 
               // && TEM PERMISSAO DO METODO UPDATE
    }
    /**
      * Retorna true se o usuário pode excluir filiais
      */
    $scope.usuarioPodeExcluirFiliais = function(){
        return $scope.usuarioPodeConsultarFiliais();
               // && TEM PERMISSAO DO METODO DELETE
    } 
    /**
      * Retorna true se o usuário pode ativar/desativar filiais
      */
    $scope.usuarioPodeDesativarFiliais = function(){
        return $scope.usuarioPodeConsultarFiliais();
               // && TEM PERMISSAO DO METODO DELETE ou OUTRO ESPECÍFICO DE ATIVAÇÃO/DESATIVAÇÃO
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
                                    [$scope.token, 2, $campos.cliente.empresa.ds_fantasia, 1, 
                                     $scope.filial.itens_pagina, $scope.filial.pagina],
                                    filtros)) 
                .then(function(dados){
                    $scope.filiais = dados.Registros;
                    $scope.filial.total_registros = dados.TotalDeRegistros;
                    $scope.filial.total_paginas = Math.ceil($scope.filial.total_registros / $scope.filial.itens_pagina);
                    var registroInicial = ($scope.filial.pagina - 1)*$scope.filial.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filial.itens_pagina;
                    if(registroFinal > $scope.filial.total_registros) registroFinal = $scope.filial.total_registros;
                    $scope.filial.faixa_registros =  registroInicial + '-' + registroFinal;

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
                                               
}]);